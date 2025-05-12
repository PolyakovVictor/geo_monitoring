import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import pickle

class PollutionPredictionModel:
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)

    def train(self, X, y):
        """
        Навчання моделі на основі вхідних даних.
        X: Вхідні дані (параметри забруднення)
        y: Цільові значення (рівень забруднення)
        """
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        self.model.fit(X_train, y_train)
        predictions = self.model.predict(X_test)
        mse = mean_squared_error(y_test, predictions)
        print(f"Mean Squared Error: {mse}")

    def predict(self, X):
        """
        Прогнозування рівня забруднення.
        X: Вхідні дані для прогнозу
        """
        return self.model.predict(X)

    def save_model(self, filepath):
        """
        Збереження моделі у файл.
        """
        with open(filepath, 'wb') as f:
            pickle.dump(self.model, f)

    def load_model(self, filepath):
        """
        Завантаження моделі з файлу.
        """
        with open(filepath, 'rb') as f:
            self.model = pickle.load(f)
