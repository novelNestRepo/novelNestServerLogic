import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Tuple

class CollaborativeFiltering:
    def __init__(self):
        self.user_ratings = {}
        self.book_ratings = {}
        self.similarity_matrix = None

    def add_rating(self, user_id: str, book_id: str, rating: float) -> None:
        """Add a new rating to the system"""
        if user_id not in self.user_ratings:
            self.user_ratings[user_id] = {}
        self.user_ratings[user_id][book_id] = rating

        if book_id not in self.book_ratings:
            self.book_ratings[book_id] = {}
        self.book_ratings[book_id][user_id] = rating

    def build_similarity_matrix(self) -> None:
        """Build the user-user similarity matrix using cosine similarity"""
        users = list(self.user_ratings.keys())
        n_users = len(users)
        rating_matrix = np.zeros((n_users, len(self.book_ratings)))

        for i, user in enumerate(users):
            for j, book in enumerate(self.book_ratings.keys()):
                rating_matrix[i, j] = self.user_ratings[user].get(book, 0)

        self.similarity_matrix = cosine_similarity(rating_matrix)

    def get_recommendations(self, user_id: str, n_recommendations: int = 5) -> List[Tuple[str, float]]:
        """Get book recommendations for a user"""
        if user_id not in self.user_ratings:
            return []

        if self.similarity_matrix is None:
            self.build_similarity_matrix()

        users = list(self.user_ratings.keys())
        user_idx = users.index(user_id)

        # Get similar users
        similar_users = [(users[i], self.similarity_matrix[user_idx][i])
                        for i in range(len(users)) if i != user_idx]
        similar_users.sort(key=lambda x: x[1], reverse=True)

        # Get recommendations based on similar users' ratings
        recommendations = {}
        for sim_user, similarity in similar_users:
            for book, rating in self.user_ratings[sim_user].items():
                if book not in self.user_ratings[user_id]:
                    if book not in recommendations:
                        recommendations[book] = 0
                    recommendations[book] += similarity * rating

        # Sort and return top N recommendations
        sorted_recommendations = sorted(recommendations.items(),
                                      key=lambda x: x[1],
                                      reverse=True)
        return sorted_recommendations[:n_recommendations]