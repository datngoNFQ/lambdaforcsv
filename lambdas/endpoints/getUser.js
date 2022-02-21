// exports.handler = async event => {
//   console.log('event', event);


// }

exports.handler = async (event) => {
  const response = {
    statusCode: 200,
    body: 'Welcome'
  }
  console.log('with handler - sub folder hello event == ', event);
  return response;
};
