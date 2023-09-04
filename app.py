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
    df['date'] = pd.to_datetime(df['local_departure']).dt.strftime('%Y-%m-%d')

    # Group by date and aggregate prices for each date
    aggregated = df.groupby('date').agg({
        'price': list,
        'fare_classes': list
    }).to_dict('index')
    return jsonify(aggregated)

@app.route('/database', methods=['GET'])
def database():
    with sqlite3.connect('flights.db') as conn:
        df = pd.read_sql_query("SELECT * FROM flights", conn)
    row_json = df.iloc[1].to_json()
    return Response(row_json, content_type='application/json')

if __name__ == '__main__':
    app.run(debug=True)
