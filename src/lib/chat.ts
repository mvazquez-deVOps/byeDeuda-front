
'use client';

import {
  collection,
  query,
  onSnapshot,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './init-firebase';
import type { ChatMessage } from './types';


/**
 * Creates a real-time listener for messages within a specific thread.
 * This still uses the client SDK as it's for the client-side UI.
 */
export function getMessagesForThread(
  threadId: string,
  callback: (messages: ChatMessage[]) => void
): () => void {
  const messagesRef = collection(db, 'chatThreads', threadId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const messages: ChatMessage[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp)?.toDate() ?? new Date(),
        } as ChatMessage);
    });
    callback(messages);
  }, (error) => {
    console.error(`Error fetching messages for thread ${threadId}:`, error);
    callback([]);
  });

  return unsubscribe;
}
