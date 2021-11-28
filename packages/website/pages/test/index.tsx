import { useAppSelector } from 'store';

const TestPage: React.FC = () => {
  const { firstName, lastName } = useAppSelector(({ userData }) => userData!);

  return (
    <div>
      {firstName}:{lastName}
    </div>
  );
};

export default TestPage;
