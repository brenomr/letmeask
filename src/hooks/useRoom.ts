import { useEffect, useState } from "react";
import { database } from "../services/firebase";

type QuestionType = {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  isHighlighted: string;
  isAnswered: string;
}

type FirebaseQuestions = Record<string, {
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  isHighlighted: string;
  isAnswered: string;
}>

export function useRoom(roomId: string) {
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
        }
      });

      setTitle(dbRoom.title);
      setQuestions(parsedQuestion);
    });
  }, [roomId]);

  return { questions, title }
}