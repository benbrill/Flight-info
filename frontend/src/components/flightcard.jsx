import React from 'react';

// Individual flight card component
function FlightCard({ airlineData }) {
    return (
        <div style={styles.card}>
            <h3>{airlineData.airlines}</h3>
            <p>Price: {airlineData.price}</p>
            <p>Fare Basis: {airlineData.fare_basis}</p>
            <p>Fare Classes: {airlineData.fare_classes}</p>
        </div>
    );
}

// Main component
function AirlineFlexbox({ data }) {
    return (
        <div style={styles.flexbox}>
            {data.map((item, index) => (
                <FlightCard key={index} airlineData={item} />
            ))}
        </div>
    );
}

// Styles for the components
const styles = {
    flexbox: {
        display: 'flex',
        flexDirection: 'row',
        gap: '16px'
    },
    card: {
        border: '1px solid #e0e0e0',
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        flex: 1,
        alignItems: 'center'
    }
}

export default AirlineFlexbox;
