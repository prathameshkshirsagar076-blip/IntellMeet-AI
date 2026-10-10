import React, { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { TeamChatModule } from '../components/chat/TeamChatModule';
import { usersApi } from '../api/users.api';
import type { UserItem } from '../types/user';

export const ChatPage: React.FC = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const recipientFromState = (location.state as { recipient?: UserItem } | null)?.recipient || null;
  const [selectedRecipient, setSelectedRecipient] = useState<UserItem | null>(recipientFromState);

  // If userId query param is provided, fetch user and select
  const userIdParam = searchParams.get('userId') || searchParams.get('recipientId');

  useEffect(() => {
    if (recipientFromState) {
      setSelectedRecipient(recipientFromState);
      return;
    }

    if (userIdParam) {
      usersApi.getUsers({ limit: 100 })
        .then((res) => {
          const match = (res?.data?.users || []).find((u) => u.id === userIdParam);
          if (match) {
            setSelectedRecipient(match);
          }
        })
        .catch(() => {});
    }
  }, [recipientFromState, userIdParam]);

  return (
    <div className="im-chat-page">
      <TeamChatModule
        fullHeight={true}
        selectedRecipient={selectedRecipient}
        onClearSelectedRecipient={() => setSelectedRecipient(null)}
      />
    </div>
  );
};

export default ChatPage;
