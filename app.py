from flask import Flask
from flask import request, jsonify, Response
from flask_cors import CORS
import pandas as pd
import sqlite3

app = Flask(__name__)
CORS(app)

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/search', methods=['GET'])
def search():
    origin = request.args.get('origin')
    destination = request.args.get('destination')
    date = request.args.get('date')

    with sqlite3.connect('flights.db') as conn:
        query = f"""
            SELECT * FROM flights
            WHERE city_code_to = '{destination}'
            AND city_code_from = '{origin}'
            AND local_departure > date('{date}')
            """
        df = pd.read_sql_query(query, conn)
    df['departure_date'] = pd.to_datetime(df['local_departure']).dt.strftime('%Y-%m-%d')

    # Group by date and aggregate prices for each date
    # aggregated = df.groupby('departure_date').agg({
    #     'price': list,
    #     'fare_classes': list
    # }).to_dict('index')
    aggregated = df.groupby(['departure_date', 'airlines'])['price'].max().reset_index().pivot_table(index = 'departure_date', columns = 'airlines', values = 'price').reset_index().to_json(orient='records')
    return Response(aggregated, content_type='application/json')

@app.route('/database', methods=['GET'])
def database():
    with sqlite3.connect('flights.db') as conn:
        df = pd.read_sql_query("SELECT * FROM flights", conn)
    row_json = df.iloc[1].to_json()
    return Response(row_json, content_type='application/json')

@app.route('/search/single_day', methods=['GET'])
def search_single_day():
    origin = request.args.get('origin')
    destination = request.args.get('destination')
    date = request.args.get('date')

    with sqlite3.connect('flights.db') as conn:
        query = f"""
            SELECT * FROM flights
            WHERE city_code_to = '{destination}'
            AND city_code_from = '{origin}'
            AND date(local_departure) = date('{date}')
            """
    df = pd.read_sql_query(query, conn)
    df['date'] = pd.to_datetime(df['extract_time']).dt.strftime('%Y-%m-%d')
    # Track min price across time for all flights
    prices = df.groupby(['date', 'airlines'])['price'].min().reset_index().pivot_table(index = 'date', columns = 'airlines', values = 'price').reset_index().to_json(orient='records')

    per_airline = df.groupby('airlines')[['price','fare_basis','fare_classes']].last().reset_index().sort_values("price").to_json(orient='records')

    return Response( "[" + prices + "," + per_airline + "]", content_type='application/json')


if __name__ == '__main__':
    app.run(debug=True)
