import * as SQLite from 'expo-sqlite'
import WeatherItem from '../models/WeatherItem';

const tableName = 'weatherData';

export const getDBConnection = () => {
  return SQLite.openDatabase('weather-data.db');
};

export const createTable = async db => {
  // create table if not exists
  const query = `CREATE TABLE IF NOT EXISTS ${tableName}(
        value TEXT NOT NULL
    );`;

  await db.transaction((tx) => {
    tx.executeSql(
      query,
      [],
      (txObj, resultSet) => {
        console.log('Table created successfully!');
      },
      (txObj, error) => {
        console.error('Error creating table:', error);
      }
    );
  });
};

export const getWeatherItems = async (db) => {
  try {
    const weatherItems = [];
    const results = await db.transaction((tx) => {
      tx.executeSql(
        `SELECT rowid as id,value FROM ${tableName}`,
        [],
        (txObj, resultSet) => {
          console.log('Item retrieved successfully!');
        },
        (txObj, error) => {
          console.error('Error retrieving item:', error);
        }
      );
    });
    if (results) {
      results.forEach(result => {
        for (let index = 0; index < result.rows.length; index++) {
          weatherItems.push(result.rows.item(index))
          console.log('result name: ' + result.rows.item(index).name);
        }
      });
      return weatherItems;
    }
    return [];
  } catch (error) {
    console.error(error);
    throw Error('Failed to get weatherItems');
  }
};

export const saveWeatherItems = async (db, weatherItems) => {
  const insertQuery =
    `INSERT OR REPLACE INTO ${tableName}(rowid, value) values` +
    weatherItems.map(i => `(${i.id}, '${i.value}')`).join(',');

  return db.transaction((tx) => {
      tx.executeSql(
        insertQuery,
        [],
        (txObj, resultSet) => {
          console.log('Item saved successfully!');
        },
        (txObj, error) => {
          console.error('Error saving item:', error);
        }
      );
    });
};

export const deleteWeatherItem = async (db, id) => {
  const deleteQuery = `DELETE from ${tableName} where rowid = ${id}`;
  await db.transaction((tx) => {
    tx.executeSql(
      deleteQuery,
      [],
      (txObj, resultSet) => {
        console.log('Item deleted successfully!');
      },
      (txObj, error) => {
        console.error('Error deleting item:', error);
      }
    );
  });
};

export const deleteTable = async (db) => {
  const query = `drop table ${tableName}`;
  await db.transaction((tx) => {
    tx.executeSql(
      query,
      [],
      (txObj, resultSet) => {
        console.log('Table deleted successfully!');
      },
      (txObj, error) => {
        console.error('Error deleting table:', error);
      }
    );
  });
};