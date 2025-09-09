import { Redirect } from "expo-router";

export default function redirectToEventTab() {
  return <Redirect href={'(main)/events/'} />
}
