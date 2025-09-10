import { apiFetch } from "@/utils/apiFetch";
import { useRouter } from 'expo-router';
import { useState } from "react";
import { useProfile } from "@/contexts/profileCtx";
import EditEventForm from "@/components/events/EditEventForm";
import { createEvent } from "@/services/events";

export default function AddEvent() {
  const router = useRouter()
  const [error, setError] = useState<string>('')
  const { profile } = useProfile();
  const [eventId, setEventId] = useState<string | null>(null);

  const onSubmit = async (payload: EventPayload) => {

	console.log("HERE IMPLEMENT POST NEW EVENT TO BACK")

	if (!profile) {
	  setError("Authentification error, try reconnect with Spotify please");
	  return;
	}

	try {
	  const resp = await createEvent({
		...payload,
	  });
	  console.log("Event created successfully:", resp);
	  if (router.canGoBack()) {
		  router.replace({
		  pathname: '/(main)/events/[eventId]',
		  params: { eventId: resp.id },
	  })
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
