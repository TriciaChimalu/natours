import axios from 'axios';
import { showAlert } from './alert';

// export const updateData = async (name, email) => {
//   try {
//     const res = await axios({
//       method: 'PATCH',
//       url: 'http://localhost:5000/api/v1/users/updateMe',
//       data: {
//         name,
//         email,
//       },
//     });
//     if (res.data.status === 'success') {
//       showAlert('success','Data updated successfully');
//     }
//   } catch (err) {
//     showAlert('error', err.response.data.message);
//   }
// };

//type is either password or data
export const updateSettings = async (data, type) => {
  console.log('update data called');
  try {
    const url =
      type === 'password'
        ? 'http://localhost:5000/api/v1/users/updateMyPassword'
        : 'http://localhost:5000/api/v1/users/updateMe';

    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    console.log(res.data.status);
    if (res.data.status === 'success') {
      showAlert('success', `${type.toUpperCase()} updated successfully`);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
    console.log(err);
  }
};
