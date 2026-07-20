import { auth } from './src/auth/auth';

(async () => {
  try {
    const res = await auth.api.signUpEmail({
      headers: new Headers({'origin': 'http://localhost:3000'}),
      body: { name: 'Pablo', email: 'pablo3@test.com', password: 'mypassword123' }
    });
    console.log("SUCCESS:", res);
  } catch (e) {
    console.error("ERROR:", e);
  }
})();
