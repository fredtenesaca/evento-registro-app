const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
    const tableName = event.tableName;
    const item = event.item;

    const params = {
        TableName: tableName,
        Item: item
    };

    try {
        await dynamo.put(params).promise();
        return { statusCode: 200, body: 'Success' };
    } catch (error) {
        return { statusCode: 500, body: 'Error: ' + error.message };
    }
};



