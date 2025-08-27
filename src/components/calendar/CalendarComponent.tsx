import { useAction, useQuery } from "convex/react";
import { PrimaryButton } from "../ui/CustomButton";
import { api } from "../../../convex/_generated/api";

export default function Form() {
  const getFreeBusy = useAction(api.calendar.getFreeBusy);
  const user = useQuery(api.user.getCurrentUser, {})
  // function that calls freeBusy
  const handleGetFreeBusy = async () => {
    try {
      const id = user?._id;
      if (!id) throw new Error("Could Not Get The User!")
      const result = await getFreeBusy({ userId: id });

      console.log("FreeBusy result:", result);
      // TODO: handle the result (show in UI, save state, etc.)
    } catch (err) {
      console.error("Error fetching FreeBusy:", err);
    }
  };

  return (
    <div>
      <PrimaryButton onClick={handleGetFreeBusy}>
        Get FreeBusy
      </PrimaryButton>
    </div>
  );
}
