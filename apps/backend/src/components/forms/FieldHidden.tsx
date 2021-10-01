import { useFormContext } from "react-hook-form";

export const FieldHidden = ({
  id,
  name,
  defaultValue,
  isRequired,
}: {
  id: string;
  isRequired?: boolean;
  name: string;
  defaultValue: string | number;
}) => {
  const {
    register,
  } = useFormContext();

  return (
    <input
      {...{ id, defaultValue, required: isRequired ?? undefined }}
      type="hidden"
      {...register(name, {
        required: isRequired,
      })}
    />
  );
};

export default FieldHidden;
