import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import * as CdkInit from '../lib/cdk-init-stack';

test('Stack synthesizes successfully', () => {
  const app = new cdk.App();
  const stack = new CdkInit.CdkInitStack(app, 'MyTestStack');
  const template = Template.fromStack(stack);
  expect(template).toBeDefined();
});
