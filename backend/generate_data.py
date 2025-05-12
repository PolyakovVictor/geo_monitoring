import pandas as pd
import random

# Генерація даних
def generate_data(num_samples=100):
    data = {
        "PM2.5": [round(random.uniform(0, 300), 2) for _ in range(num_samples)],
        "PM10": [round(random.uniform(0, 300), 2) for _ in range(num_samples)],
        "Nitrogen Dioxide": [round(random.uniform(0, 500), 2) for _ in range(num_samples)],
        "Sulfur Dioxide": [round(random.uniform(0, 500), 2) for _ in range(num_samples)],
        "Carbon Monoxide": [round(random.uniform(0, 100), 2) for _ in range(num_samples)],
        "Ozone": [round(random.uniform(0, 300), 2) for _ in range(num_samples)],
        "Lead": [round(random.uniform(0, 5), 4) for _ in range(num_samples)],
        "Cadmium": [round(random.uniform(0, 1), 4) for _ in range(num_samples)],
        "Radiation": [round(random.uniform(0, 10), 2) for _ in range(num_samples)],
        "Target": [random.randint(1, 10) for _ in range(num_samples)],  # Наприклад, індекс якості повітря
    }
    return pd.DataFrame(data)

# Збереження у файл
df = generate_data(100)
df.to_csv("training_data.csv", index=False)
print("Файл training_data.csv успішно створено!")
