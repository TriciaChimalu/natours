/*eslint-disabled*/
import axios from 'axios';
import { showAlert } from './alert';
const stripe = Stripe(
  'pk_test_51TxYXqJAAwABaOugPu3It6IQKBRI72ggl70q0YvooDJX3DOOR7imfi8m2cu0TigxUZ8qtw8eYRnVr3iqpGQl2PqX00f3fsuWCw',
);

export const bookTour = async (tourId) => {
  try {
    //1)Get checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

    //2) Create checkout form + charge credit card

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    showAlert('error', err);
  }
};
