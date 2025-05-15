from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
from typing import List, Optional
from services.recommendation_service import RecommendationService
from fastapi.security import RateLimiter
import logging

app = FastAPI(title="NovelNest Recommendation Service")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

recommendation_service = RecommendationService()
limiter = RateLimiter(times=10, seconds=60)  # 10 requests per minute

class Rating(BaseModel):
    user_id: str
    book_id: str
    rating: float

    @validator('rating')
    def validate_rating(cls, v):
        if not 0 <= v <= 5:
            raise ValueError('Rating must be between 0 and 5')
        return v

class RecommendationRequest(BaseModel):
    user_id: str
    n_recommendations: Optional[int] = 5

@app.post("/ratings")
async def add_rating(rating: Rating, _: bool = Depends(limiter)):
    logger.info(f"Adding rating for user {rating.user_id} and book {rating.book_id}")
    try:
        recommendation_service.add_user_rating(
            rating.user_id,
            rating.book_id,
            rating.rating
        )
        return {"message": "Rating added successfully"}
    except ValueError as e:
        logger.error(f"Invalid rating value: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error while adding rating: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/recommendations")
async def get_recommendations(request: RecommendationRequest, _: bool = Depends(limiter)):
    logger.info(f"Getting recommendations for user {request.user_id}")
    try:
        if request.n_recommendations < 1:
            raise ValueError("Number of recommendations must be positive")
            
        recommendations = recommendation_service.get_book_recommendations(
            request.user_id,
            request.n_recommendations
        )
        
        if not recommendations:
            return {"recommendations": [], "message": "No recommendations available for this user"}
            
        return {"recommendations": recommendations}
    except ValueError as e:
        logger.error(f"Invalid request parameters: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except KeyError:
        logger.error(f"User {request.user_id} not found")
        raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        logger.error(f"Unexpected error while getting recommendations: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/update-similarity")
async def update_similarity_matrix(_: bool = Depends(limiter)):
    logger.info("Updating similarity matrix")
    try:
        recommendation_service.update_similarity_matrix()
        return {"message": "Similarity matrix updated successfully"}
    except ValueError as e:
        logger.error(f"Invalid data for similarity matrix update: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error while updating similarity matrix: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")