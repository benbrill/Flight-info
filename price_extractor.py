import requests
import pandas as pd
import os
import sqlite3
import datetime
import json

ACCESS_TOKEN = os.environ.get('KIWI_API_KEY')

def make_request(origin, destination, date_from, date_to, airlines:str):
    url = "https://api.tequila.kiwi.com/v2/search"

    data = {
        "fly_from": origin,
        "fly_to": destination,
        "date_from": date_from,
        "date_to": date_to,
        "adults": 1,
        "selected_cabins": "M",
        "select_airlines": airlines,
        "select_airlines_exclude": False,
        "curr": "USD",
        "max_stopovers": 0,
        "limit": 1000
    }

    r = requests.get(url=url, headers= {"accept": "application/json", "apikey": ACCESS_TOKEN}, params = data)
    print(r.status_code)
    r = r.json()
    return r

def make_df(r):
    df_list = []
    for flight in r['data']:
        df_dict = {}
        df_dict['id'] = flight['id'] + str(pd.Timestamp.now().strftime('%Y%m%d%H'))
        df_dict['extract_time'] = pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')
        df_dict['flight_id'] = str(flight['airlines'][0]) + str(flight['route'][0]['flight_no']) + str(pd.to_datetime(flight['local_departure']).strftime('%y%m%d%H'))
        df_dict['fly_from'] = flight['flyFrom']
        df_dict['fly_to'] = flight['flyTo']
        df_dict['city_from'] = flight['cityFrom']
        df_dict['city_code_from'] = flight['cityCodeFrom']
        df_dict['city_to'] = flight['cityTo']
        df_dict['city_code_to'] = flight['cityCodeTo']
        df_dict['local_departure'] = pd.to_datetime(flight['local_departure']).strftime('%Y-%m-%d %H:%M')
        df_dict['local_arrival'] = pd.to_datetime(flight['local_arrival']).strftime('%Y-%m-%d %H:%M')
        df_dict['airlines'] = flight['airlines'][0]
        df_dict['distance'] = flight['distance']
        df_dict['fare'] = flight['fare']['adults']
        df_dict['price'] = flight['price']
        for route in flight['route']:
            df_dict['flight_number'] = route['flight_no']
            df_dict['fare_classes'] = route['fare_classes']
            df_dict['fare_basis'] = route['fare_basis']
            df_dict['fare_category'] = route['fare_category']
            df_dict['equipment'] = route['equipment']

        df_list.append(df_dict)
    df = pd.DataFrame(df_list)
    return df

def create_db(df):
    with sqlite3.connect('flights.db') as conn:
        df.to_sql('flights', conn, if_exists='append', index=False)

def main():
    with open('tracked_flights.json'):
        data = json.load('tracked_flights.json')
    
    today = datetime.date.today()
    four_months = today + datetime.timedelta(120)
    today = today.strftime('%d/%m/%Y')
    four_months = four_months.strftime('%d/%m/%Y')

    for flight in data:
        r = make_request(flight['fly_from'], flight['fly_to'], today, four_months, flight['select_airlines'])
        df = make_df(r)
        create_db(df)


if __name__ == '__main__':
    main()