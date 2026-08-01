var $knI9B$axios = require('axios');

function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}
/*eslint-disable*/

const $70af9284e599e604$export$596d806903d1f59e = async (email, password) => {
  //console.log(email, password);
  //get axios cdn and add it to the base template
  try {
    const res = await (0, $parcel$interopDefault($knI9B$axios))({
      method: 'POST',
      url: 'http://localhost:5000/api/v1/users/login',
      data: {
        email: email,
        password: password,
      },
    });
    if (res.data.status === 'success') {
      alert('Logged in successfully!');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    alert(err.response.data.message);
  }
};

document.querySelector('.form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  (0, $70af9284e599e604$export$596d806903d1f59e)(email, password);
});

//# sourceMappingURL=index.js.map
