import { useEffect, useState } from "react";
import { database } from "../services/firebase";
import { useAuth } from "./useAuth";

type QuestionType = {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  isHighlighted: boolean;
  isAnswered: boolean;
  likecount: number;
  likeId: string | undefined;
}

type FirebaseQuestions = Record<string, {
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  isHighlighted: boolean;
  isAnswered: boolean;
  likes: Record<string, {
    authorId: string;
  }>
}>

export function useRoom(roomId: string) {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [title, setTitle] = useState();

  useEffect(() => {
    const roomRef = database.ref(`rooms/${roomId}`);

    // Usando .on() ele 'escuta' o tempo todo, com .once() apenas 1 vez 
    roomRef.on('value', room => {
      const dbRoom = room.val();
      const firebaseQuestions: FirebaseQuestions = dbRoom.questions ?? {};
      const parsedQuestion = Object.entries(firebaseQuestions).map(([key, value]) => {
        return {
          id: key,
          content: value.content,
          author: value.author,
          isHighlighted: value.isHighlighted,
          isAnswered: value.isAnswered,
          likecount: Object.values(value.likes ?? {}).length,
          // hasLiked: Object.values(value.likes ?? {}).some(like => like.authorId === user?.id),
          likeId: Object.entries(value.likes ?? {}).find(([key, like]) => like.authorId === user?.id)?.[0],
        }
      });

      setTitle(dbRoom.title);
      setQuestions(parsedQuestion);
    });

    return () => {
      roomRef.off('value');
    }
  }, [roomId, user?.id]);

  return { questions, title }
}