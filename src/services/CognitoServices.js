import {Auth} from 'aws-amplify';
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js';
import {REACT_APP_USER_POOL_ID, REACT_APP_CLIENT_ID} from 'react-native-dotenv';

const poolData = {
  UserPoolId: REACT_APP_USER_POOL_ID,
  ClientId: REACT_APP_CLIENT_ID,
};

console.log(REACT_APP_USER_POOL_ID, REACT_APP_CLIENT_ID);

const userPool = new CognitoUserPool(poolData);

// Sign up function
export const signUp = (
  username,
  password,
  email,
  birthdate,
  phonenumber,
  name,
  callback,
) => {
  const attributeList = [];

  const dataEmail = {
    Name: 'email',
    Value: email,
  };
  const attributeEmail = new CognitoUserAttribute(dataEmail);
  attributeList.push(attributeEmail);

  const dataBirthdate = {
    Name: 'birthdate',
    Value: birthdate,
  };
  const attributeBirthdate = new CognitoUserAttribute(dataBirthdate);
  attributeList.push(attributeBirthdate);

  const dataPhonenumber = {
    Name: 'phone_number',
    Value: phonenumber,
  };
  const attributePhonenumber = new CognitoUserAttribute(dataPhonenumber);
  attributeList.push(attributePhonenumber);

  const dataName = {
    Name: 'name',
    Value: name,
  };
  const attributeName = new CognitoUserAttribute(dataName);
  attributeList.push(attributeName);

  userPool.signUp(username, password, attributeList, null, (err, result) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, result);
    }
  });
};

// Sign in function
export const signIn = async (username, password, callback) => {
  try {
    const user = await Auth.signIn(username, password);
    callback(null, user);
  } catch (err) {
    callback(err, null);
  }
};

// Sign out function
export const signOut = async () => {
  try {
    await Auth.signOut();
  } catch (err) {
    console.error('Error signing out: ', err);
  }
};

// Confirm sign-up function
export const confirmSignUp = async (username, code, callback) => {
  try {
    const result = await Auth.confirmSignUp(username, code);
    callback(null, result);
  } catch (err) {
    callback(err, null);
  }
};

// Get current user session function
export const getCurrentUser = async callback => {
  try {
    const user = await Auth.currentAuthenticatedUser();
    callback(null, user);
  } catch (err) {
    callback(err, null);
  }
};

// Sign in with Google function
export const signInWithGoogle = async callback => {
  try {
    const user = await Auth.federatedSignIn({provider: 'Google'});
    callback(null, user);
  } catch (err) {
    callback(err, null);
  }
};
