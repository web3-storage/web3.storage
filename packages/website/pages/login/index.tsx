import clsx from 'clsx';
import { useRouter } from 'next/router';
import { useState } from 'react';

import styles from './index.module.scss';
import { useAppDispatch } from 'store';
import { setAuthToken } from 'store/actions';

const Login = () => {
  const { push } = useRouter();
  // const { useDispatch } = use();
  const dispatch = useAppDispatch();

  const [{ user, password }, setFormData] = useState<{ user?: string; password?: string }>({});

  return (
    <div className={clsx(styles['login-container'])}>
      <input placeholder="user" onChange={e => setFormData({ user: e.target.value, password })} />
      <input placeholder="password" type="password" onChange={e => setFormData({ user, password: e.target.value })} />
      <input
        type="button"
        value="Login"
        onClick={async () => {
          await dispatch(await setAuthToken(user, password));
          push('/test');
        }}
      />
    </div>
  );
};

export default Login;
