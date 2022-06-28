// /**
//  * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
//  */
// exports.handler = async (event, context) => {
//   // insert code to be executed by your lambda trigger
//   return event
// };
// /**
//  * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
//  */

const aws = require("aws-sdk");
const ddb = new aws.DynamoDB();

const tableName = process.env.USERTABLE;

exports.handler = async (event, context) => {
  // insert code to be executed by your lambda trigger
  /*
    object?.attr 
    object 恒等于 null 或者 undefined 时，取值为 undefined，否则为 object.attr
  */
  if (!event ?.request ?.userAttributes ?.sub) {
    console.log('No sub provided 没有用户信息提供', event.request);
    return
  } else {
    console.log('捕捉到用户信息')
  }

  const userData = event.request.userAttributes;
  const now = new Date();
  const timestamp = now.getTime();

  const userItem = {
    createdAt: { S: now.toISOString() },
    updatedAt: { S: now.toISOString() },
    _lastChangedAt: { N: timestamp.toString() },
    _version: { N: "1" },
    __typename: { S: 'User' },
    id: { S: userData.sub },
    name: { S: userData.email },
  }

  const params = {
    Item: userItem,
    TableName: tableName, // User-vd2vkb76g5b7fjpia5yo56k5ui-staging
  }

  // save a new user to DynamoDB
  try {
    await ddb.putItem(params).promise()
    console.log('save a new user to DynamoDB -- success')
  } catch (e) {
    console.log('save a new user to DynamoDB -- error', e)
  }

  return event
};