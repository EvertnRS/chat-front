import { useNavigate } from 'react-router-dom';


const EditProfileButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/edit-profile')}
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        backgroundColor: '#6a5acd',
        color: 'white',
        border: 'none',
        padding: '10px 16px',
        borderRadius: '8px',
        cursor: 'pointer'
      }}
    >
      Editar Perfil
    </button>
  );
};

export default EditProfileButton;
