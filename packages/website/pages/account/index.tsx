import { useAppSelector } from 'store';

const Account: React.FC = () => {
  const { firstName, lastName } = useAppSelector(({ userData }) => userData!);

  return (
    <div>
      firstname: {firstName}
      <br />
      lastname: {lastName}
    </div>
  );
};

export default Account;
