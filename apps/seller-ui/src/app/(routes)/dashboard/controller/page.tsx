'use client'
import { useForm, Controller } from "react-hook-form";
import Select from "react-select"; // 3rd-party select

export default function MyForm() {
  const { handleSubmit, control } = useForm();

  const onSubmit = (data:any) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="category"
        control={control}
        defaultValue=""
        render={({ field }) => (
          <Select
            {...field}
            options={[
              { value: "books", label: "Books" },
              { value: "music", label: "Music" },
            ]}
          />
        )}
      />
      <button type="submit" className="text-white">Submit</button>
    </form>
  );
}
