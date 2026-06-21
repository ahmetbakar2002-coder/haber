class NewsroomException(Exception):
    """Base exception for all Newsroom related errors"""
    def __init__(self, message: str, code: str = "INTERNAL_ERROR"):
        self.message = message
        self.code = code
        super().__init__(self.message)

class DatabaseException(NewsroomException):
    def __init__(self, message: str):
        super().__init__(message, code="DB_ERROR")

class QueueException(NewsroomException):
    def __init__(self, message: str):
        super().__init__(message, code="QUEUE_ERROR")

class APIFetchException(NewsroomException):
    def __init__(self, message: str):
        super().__init__(message, code="API_FETCH_ERROR")

class DuplicateArticleException(NewsroomException):
    def __init__(self, message: str = "Article is a duplicate"):
        super().__init__(message, code="DUPLICATE_ARTICLE")
