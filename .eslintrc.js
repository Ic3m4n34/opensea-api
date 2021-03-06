module.exports = {
  extends: [
    'airbnb-base',
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : ['error', {
      allow: ['error', 'info', 'log'],
    }],
  },
};
