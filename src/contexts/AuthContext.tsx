import {
  createContext,
  ReactNode,
  useEffect,
  useState
} from "react";
import { auth, firebase } from '../services/firebase';

// 'Tipando' context e usuário
type UserType = {
  id: string;
  name: string;
  avatar: string;
}

// user pode ser UserType ou undefined uma vez que no 1º acesso ele é undefined
type AuthContextType = {
  user: UserType | undefined;
  signInWithGoogle: () => Promise<void>;
}

type AuthContextProviderType = {
  children: ReactNode;
}

// Guardar contexto para compartilhar no app
export const AuthContext = createContext({} as AuthContextType);

export function AuthContextProvider(props: AuthContextProviderType) {

  const [user, setUser] = useState<UserType>();

  // Dispara função do firebase para inspecionar user logado antes
  // do 'refresh' e 'seta' esse user no estado para mantê-lo logado
  useEffect(() => {
    // Boas práticas, guardar eventos do tipo listner dentro de var
    // para eventualmente 'desligá-lo'
    const unsubscribe = auth.onAuthStateChanged(user => {
      if(user) {
        const { displayName, photoURL, uid } = user;

        if(!displayName || !photoURL) {
          throw new Error('Missing information from your Google Account.');
        }
  
        setUser({ id: uid, name: displayName, avatar: photoURL, });
      }
    });

    return () => {
      unsubscribe();
    }
  }, [])

  // Função para autenticação com a conta Google, armazenamento das informações no estado
  async function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();

    const result = await auth.signInWithPopup(provider);
    
    if(result.user) {
      const { displayName, photoURL, uid } = result.user;

      if(!displayName || !photoURL) {
        throw new Error('Missing information from your Google Account.');
      }

      setUser({ id: uid, name: displayName, avatar: photoURL, });
    }
  }

  return (
    // Engloba as rotas do app no contexto e envia dados do user e função para elas
    <AuthContext.Provider value={{ user, signInWithGoogle }}>
      {props.children}
    </AuthContext.Provider>
  );
}