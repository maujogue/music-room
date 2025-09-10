import { apiFetch } from "@/utils/apiFetch";
import { useRouter } from 'expo-router';
import { useState } from "react";
import { useProfile } from "@/contexts/profileCtx";
import EditEventForm from "@/components/events/EditEventForm";
import { updateEvent } from "@/services/events";
import { useLocalSearchParams } from "expo-router";

export default function EditEvent() {
  const router = useRouter()
  const [error, setError] = useState<string>('')
  const { profile } = useProfile();
  const { eventId: eventId } = useLocalSearchParams();

  const onSubmit = async (payload: EventPayload) => {
	if (!profile) {
	  setError("Authentification error, try reconnect with Spotify please");
	  return;
	}

	try {
	  const resp = await updateEvent(eventId, {
		...payload,
	  });
	  if (router.canGoBack()) {
		  router.back();
	  }
	} catch (error) {
	  console.error("Error creating event:", error);
	  setError(`Error creating event: ${error}`);
	  return;
	}
  }

  return (
	<EditEventForm onSubmit={onSubmit} ApiError={error} />
  );
}
