package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/confluentinc/confluent-kafka-go/v2/kafka"
	"github.com/mmcdole/gofeed"
)

// RawNewsMessage is the struct we send to Kafka
type RawNewsMessage struct {
	Source      string   `json:"source"`
	URL         string   `json:"url"`
	PublishTime string   `json:"publish_time"`
	Title       string   `json:"title"`
	Content     string   `json:"content"`
	Images      []string `json:"images"`
}

var rssFeeds = map[string]string{
	"BBC Sport": "http://feeds.bbci.co.uk/sport/rss.xml",
	"ESPN":      "https://www.espn.com/espn/rss/news",
	"SkySports": "https://www.skysports.com/rss/12040",
}

func main() {
	log.Println("Starting RSS Ingestion Service...")

	broker := os.Getenv("KAFKA_BROKERS")
	if broker == "" {
		broker = "localhost:9092"
	}

	p, err := kafka.NewProducer(&kafka.ConfigMap{"bootstrap.servers": broker})
	if err != nil {
		log.Fatalf("Failed to create producer: %s\n", err)
	}
	defer p.Close()

	// Delivery report handler for produced messages
	go func() {
		for e := range p.Events() {
			switch ev := e.(type) {
			case *kafka.Message:
				if ev.TopicPartition.Error != nil {
					log.Printf("Delivery failed: %v\n", ev.TopicPartition)
				} else {
					log.Printf("Delivered message to %v\n", ev.TopicPartition)
				}
			}
		}
	}()

	fp := gofeed.NewParser()

	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	// Handle graceful shutdown
	sigs := make(chan os.Signal, 1)
	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)

	// Run first fetch immediately
	fetchFeeds(fp, p)

	for {
		select {
		case <-ticker.C:
			fetchFeeds(fp, p)
		case <-sigs:
			log.Println("Shutting down...")
			return
		}
	}
}

func fetchFeeds(fp *gofeed.Parser, p *kafka.Producer) {
	topic := "raw-news"

	for sourceName, url := range rssFeeds {
		log.Printf("Fetching from %s: %s", sourceName, url)
		feed, err := fp.ParseURL(url)
		if err != nil {
			log.Printf("Error fetching %s: %v", sourceName, err)
			continue
		}

		for _, item := range feed.Items {
			// Basic mapping
			var imageUrls []string
			if item.Image != nil {
				imageUrls = append(imageUrls, item.Image.URL)
			}

			msg := RawNewsMessage{
				Source:      sourceName,
				URL:         item.Link,
				PublishTime: item.Published,
				Title:       item.Title,
				Content:     item.Description,
				Images:      imageUrls,
			}

			msgBytes, _ := json.Marshal(msg)

			err = p.Produce(&kafka.Message{
				TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
				Value:          msgBytes,
			}, nil)

			if err != nil {
				log.Printf("Failed to produce message: %v", err)
			}
		}
	}
	// Wait for messages to be delivered
	p.Flush(15 * 1000)
}
