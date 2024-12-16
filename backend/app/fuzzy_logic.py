import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl
import json
from typing import Dict, Any


class AdvancedAirQualityFuzzySystem:
    def __init__(self):
        # Вхідні змінні
        self.pm25 = ctrl.Antecedent(np.arange(0, 300, 1), 'PM2.5')
        self.pm10 = ctrl.Antecedent(np.arange(0, 300, 1), 'PM10')
        self.no2 = ctrl.Antecedent(np.arange(0, 500, 1), 'Nitrogen Dioxide')
        self.so2 = ctrl.Antecedent(np.arange(0, 500, 1), 'Sulfur Dioxide')
        self.co = ctrl.Antecedent(np.arange(0, 100, 1), 'Carbon Monoxide')
        self.ozone = ctrl.Antecedent(np.arange(0, 300, 1), 'Ozone')
        self.lead = ctrl.Antecedent(np.arange(0, 5, 0.01), 'Lead')
        self.cadmium = ctrl.Antecedent(np.arange(0, 1, 0.001), 'Cadmium')
        self.radiation = ctrl.Antecedent(np.arange(0, 10, 0.1), 'Radiation')

        # Вихідна змінна - якість повітря
        self.air_quality = ctrl.Consequent(np.arange(0, 11, 1), 'Air Quality')

        # Функції належності для PM2.5
        self.pm25['low'] = fuzz.trimf(self.pm25.universe, [0, 0, 25])
        self.pm25['moderate'] = fuzz.trimf(self.pm25.universe, [15, 50, 100])
        self.pm25['high'] = fuzz.trimf(self.pm25.universe, [75, 150, 300])

        # Функції належності для PM10
        self.pm10['low'] = fuzz.trimf(self.pm10.universe, [0, 0, 50])
        self.pm10['moderate'] = fuzz.trimf(self.pm10.universe, [25, 75, 150])
        self.pm10['high'] = fuzz.trimf(self.pm10.universe, [100, 200, 300])

        # Функції належності для NO2
        self.no2['low'] = fuzz.trimf(self.no2.universe, [0, 0, 100])
        self.no2['moderate'] = fuzz.trimf(self.no2.universe, [50, 150, 250])
        self.no2['high'] = fuzz.trimf(self.no2.universe, [200, 350, 500])

        # Функції належності для SO2
        self.so2['low'] = fuzz.trimf(self.so2.universe, [0, 0, 100])
        self.so2['moderate'] = fuzz.trimf(self.so2.universe, [50, 200, 350])
        self.so2['high'] = fuzz.trimf(self.so2.universe, [250, 400, 500])

        # Функції належності для CO
        self.co['low'] = fuzz.trimf(self.co.universe, [0, 0, 25])
        self.co['moderate'] = fuzz.trimf(self.co.universe, [15, 40, 60])
        self.co['high'] = fuzz.trimf(self.co.universe, [50, 75, 100])

        # Функції належності для Ozone
        self.ozone['low'] = fuzz.trimf(self.ozone.universe, [0, 0, 50])
        self.ozone['moderate'] = fuzz.trimf(self.ozone.universe, [25, 100, 175])
        self.ozone['high'] = fuzz.trimf(self.ozone.universe, [150, 250, 300])

        # Функції належності для важких металів
        self.lead['low'] = fuzz.trimf(self.lead.universe, [0, 0, 1])
        self.lead['high'] = fuzz.trimf(self.lead.universe, [0.5, 2, 5])

        self.cadmium['low'] = fuzz.trimf(self.cadmium.universe, [0, 0, 0.2])
        self.cadmium['high'] = fuzz.trimf(self.cadmium.universe, [0.1, 0.5, 1])

        # Функції належності для радіації
        self.radiation['safe'] = fuzz.trimf(self.radiation.universe, [0, 0, 2])
        self.radiation['moderate'] = fuzz.trimf(self.radiation.universe, [1, 3, 5])
        self.radiation['high'] = fuzz.trimf(self.radiation.universe, [4, 7, 10])

        # Функції належності для якості повітря
        self.air_quality['excellent'] = fuzz.trimf(self.air_quality.universe, [0, 0, 3])
        self.air_quality['good'] = fuzz.trimf(self.air_quality.universe, [2, 4, 6])
        self.air_quality['moderate'] = fuzz.trimf(self.air_quality.universe, [5, 6, 7])
        self.air_quality['poor'] = fuzz.trimf(self.air_quality.universe, [6, 8, 9])
        self.air_quality['hazardous'] = fuzz.trimf(self.air_quality.universe, [8, 10, 10])

        # Створення правил нечіткої логіки
        rules = [
            # Правило 1: Низькі забруднення у всіх параметрах
            ctrl.Rule(
                self.pm25['low'] & self.pm10['low'] & 
                self.no2['low'] & self.so2['low'] & 
                self.co['low'] & self.ozone['low'] & 
                self.lead['low'] & self.cadmium['low'] & 
                self.radiation['safe'], 
                self.air_quality['excellent']
            ),

            # Правило 2: Помірне забруднення дрібнодисперсними частинками
            ctrl.Rule(
                (self.pm25['moderate'] | self.pm10['moderate']) & 
                self.no2['low'] & self.so2['low'] & 
                self.co['low'] & self.ozone['low'], 
                self.air_quality['good']
            ),

            # Правило 3: Підвищене забруднення газами
            ctrl.Rule(
                self.pm25['low'] & 
                (self.no2['moderate'] | self.so2['moderate'] | self.co['moderate']), 
                self.air_quality['moderate']
            ),

            # Правило 4: Висока концентрація озону
            ctrl.Rule(
                self.ozone['high'], 
                self.air_quality['poor']
            ),

            # Правило 5: Важкі метали та радіація
            ctrl.Rule(
                (self.lead['high'] | self.cadmium['high'] | self.radiation['high']), 
                self.air_quality['hazardous']
            ),

            # Правило 6: Комбінація помірних забруднень
            ctrl.Rule(
                (self.pm25['moderate'] | self.pm10['moderate']) & 
                (self.no2['moderate'] | self.so2['moderate']) & 
                self.co['moderate'], 
                self.air_quality['poor']
            ),

            # Правило 7: Високе забруднення дрібнодисперсними частинками
            ctrl.Rule(
                (self.pm25['high'] | self.pm10['high']), 
                self.air_quality['poor']
            ),

            # Правило 8: Критичне забруднення газами
            ctrl.Rule(
                (self.no2['high'] | self.so2['high'] | self.co['high']), 
                self.air_quality['hazardous']
            ),

            # Правило 9: Складна комбінація забруднень
            ctrl.Rule(
                self.pm25['high'] & self.no2['high'] & 
                self.so2['high'] & self.ozone['high'], 
                self.air_quality['hazardous']
            )
        ]

        # Створення системи контролю
        self.air_quality_ctrl = ctrl.ControlSystem(rules)
        self.air_quality_simulation = ctrl.ControlSystemSimulation(self.air_quality_ctrl)

    def evaluate_air_quality(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Оцінка якості повітря на основі нечіткої логіки
        """
        try:
            # Введення даних в систему
            self.air_quality_simulation.input['PM2.5'] = data['pm2_5']
            self.air_quality_simulation.input['PM10'] = data['pm10']
            self.air_quality_simulation.input['Nitrogen Dioxide'] = data['nitrogen_dioxide']
            self.air_quality_simulation.input['Sulfur Dioxide'] = data['sulfur_dioxide']
            self.air_quality_simulation.input['Carbon Monoxide'] = data['carbon_monoxide']
            self.air_quality_simulation.input['Ozone'] = data['ozone']
            self.air_quality_simulation.input['Lead'] = data['lead']
            self.air_quality_simulation.input['Cadmium'] = data['cadmium']
            self.air_quality_simulation.input['Radiation'] = data['radiation_level']

            # Обчислення результату
            self.air_quality_simulation.compute()

            # Отримання результату
            air_quality_score = self.air_quality_simulation.output['Air Quality']

            # Інтерпретація результату
            if air_quality_score <= 2:
                quality_description = "Відмінна"
                health_recommendation = "Повітря абсолютно безпечне для всіх груп населення."
            elif air_quality_score <= 4:
                quality_description = "Добра"
                health_recommendation = "Повітря цілком прийнятне, незначний ризик для чутливих груп."
            elif air_quality_score <= 6:
                quality_description = "Задовільна"
                health_recommendation = "Можливий незначний вплив на здоров'я, особливо для чутливих груп."
            elif air_quality_score <= 8:
                quality_description = "Погана"
                health_recommendation = "Високий ризик для здоров'я. Рекомендовано обмежити перебування на вулиці."
            else:
                quality_description = "Небезпечна"
                health_recommendation = "Критичний стан забруднення. Негайно вжити заходів безпеки."

            return {
                "score": round(air_quality_score, 2),
                "description": quality_description,
                "health_recommendation": health_recommendation,
                "detailed_parameters": {
                    "PM2.5": data['pm2_5'],
                    "PM10": data['pm10'],
                    "NO2": data['nitrogen_dioxide'],
                    "SO2": data['sulfur_dioxide'],
                    "CO": data['carbon_monoxide'],
                    "Ozone": data['ozone'],
                    "Lead": data['lead'],
                    "Cadmium": data['cadmium'],
                    "Radiation": data['radiation_level']
                }
            }

        except Exception as e:
            return {"error": str(e)}


# Приклад використання
def main():
    # Приклад даних з попереднього прикладу
    sample_data = {
        "pm2_5": 73.07,
        "pm10": 119.04,
        "nitrogen_dioxide": 109.27,
        "sulfur_dioxide": 383.24,
        "carbon_monoxide": 13.67,
        "ozone": 111.43,
        "lead": 0.4096,
        "cadmium": 0.1545,
        "radiation_level": 2.39
    }

    fuzzy_system = AdvancedAirQualityFuzzySystem()
    result = fuzzy_system.evaluate_air_quality(sample_data)
    print(json.dumps(result, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()