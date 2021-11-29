import clsx from 'clsx';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';

import styles from './index.module.scss';
import { useAppDispatch } from 'store';
import { getUserData, setAuthToken } from 'store/actions';

const Login = () => {
  // App wide methods
  const dispatch = useAppDispatch();
  const { push } = useRouter();

  // Error states
  const [errors, setErrors] = useState<{ user?: boolean; password?: boolean }>({});

  // User form data binding
  const [{ user, password }, setFormData] = useState<{ user?: string; password?: string }>({});

  // Callback for submission
  const onSubmit = useCallback(
    async e => {
      e.preventDefault();

      // Errors for empty fields
      if (!user || !password) {
        setErrors({ user: !user, password: !password });
        return false;
      }

      // Setting auth token
      const {
        payload: { authentication },
      } = await dispatch(await setAuthToken(user, password));

      // Getting user data
      await dispatch(await getUserData(authentication));

      // Redirecting to account page
      push('/account');
    },
    [dispatch, password, push, user]
  );

  return (
    <div className={clsx(styles['login-container'])}>
      <form>
        <input
          placeholder="user"
          className={clsx(errors.user && styles.error)}
          required
          onChange={e => setFormData({ user: e.target.value, password })}
        />
        <input
          placeholder="password"
          required
          type="password"
          onChange={e => setFormData({ user, password: e.target.value })}
          className={clsx(errors.password && styles.error)}
        />
        <input type="submit" value="Login" onClick={onSubmit} />
      </form>
    </div>
  );
};

export default Login;
