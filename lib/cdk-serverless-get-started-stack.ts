import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as apigw from '@aws-cdk/aws-apigateway';

export class CdkServerlessGetStartedStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
  
    // dynamodb table definition
    const table = new dynamodb.Table(this, 'Hello', {
      partitionKey: { name: "name", type: dynamodb.AttributeType.STRING},
    });  

    // lambda function
    const dynamoLambda = new lambda.Function(this, "DynamoLambdaHandler", {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: lambda.Code.fromAsset("functions"),
      handler: "function.handler",
      environment: {
        HELLO_TABLE_NAME: table.tableName
      },
    })

    // permission to the lamda to dynamo table
    table.grantReadWriteData(dynamoLambda);

    // create the API gateway with one method and path
    const api = new apigw.RestApi(this, "hello-api");

    api.root.resourceForPath("Hello").addMethod("GET", new apigw.LambdaIntegration(dynamoLambda));

  
  }



}
