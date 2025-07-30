'use client'
import ImagePlaceHolder from 'apps/seller-ui/src/shared/components/image-placeholder'

import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form';
import Input from "../../../../../../../packages/components/input/index"
import ColorSelector from 'packages/components/color-selector/index';
import CustomSpecifications from 'packages/components/custom-specifications';
import CustomProperties from 'packages/components/custom-properties';
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';
import { useQuery } from '@tanstack/react-query';


const page = () => {

  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [openImageModal, setOpenImageModal] = useState(false);
  const [isChanged, setIsChanged] = useState(true);
  const [activeEffect, setActiveEffect] = useState<string | null>(null);


  const [images, setImages] = useState<(File | null)[]>([null]);


  const router = useRouter();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get(
          "/product/api/get-categories"
         
        );
        return res.data;
      } catch (error) {
        console.log(error);
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
const categories = data?.categories || [];
  const subCategoriesData = data?.subCategories || {};

    const selectedCategory = watch("category");


  const subcategories = useMemo(() => {
    return selectedCategory ? subCategoriesData[selectedCategory] || [] : [];
  }, [selectedCategory, subCategoriesData]);

  const handleImageChange = async (file: File | null, index: number) => {
    if (!file) return;

    console.log(images);
    const updatedImages = [...images];

    updatedImages[index] = file

    if (index === images.length - 1 && updatedImages.length < 8) {
      updatedImages.push(null);
    }
    console.log(updatedImages);
    setImages(updatedImages);
    setValue("images", updatedImages);

  }
  const handleRemoveImage = async (index: number) => {
    try {
      const updatedImages = [...images];




      updatedImages.splice(index, 1);

      // Add null placeholder
      if (!updatedImages.includes(null) && updatedImages.length < 8) {
        updatedImages.push(null);
      }

      setImages(updatedImages);
      setValue("images", updatedImages);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <form
      className="w-full mx-auto p-8 shadow-md rounded-lg text-white"

    >
      {/* Heading & Breadcrumbs */}
      <h2 className="text-2xl py-2 font-semibold font-Poppins text-white">
        Create Product
      </h2>

      {/* Content Layout */}
      <div className="py-4 w-full flex gap-6">
        {/* Left side - Image upload section */}
        <div className="md:w-[35%]">
          {images?.length > 0 && (
            <ImagePlaceHolder
              setOpenImageModal={setOpenImageModal}
              size="765 x 850"
              small={false}
              images={images}

              index={0}
              onImageChange={handleImageChange}

              onRemove={handleRemoveImage}
            />
          )}

          <div className="grid grid-cols-2 gap-3 mt-4">
            {images.slice(1).map((_, index) => (
              <ImagePlaceHolder
                setOpenImageModal={setOpenImageModal}
                size="765 x 850"

                images={images}
                key={index}
                small

                index={index + 1}
                onImageChange={handleImageChange}
                onRemove={handleRemoveImage}
              />
            ))}
          </div>
        </div>
        <div className="md:w-[65%]">
          <div className="w-full flex gap-6"
          >
            {/* Product Title Input */}
            <div className="w-2/4">
              <Input
                label="Product Title *"
                placeholder="Enter product title"
                {...register("title", { required: "Title is required" })}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.title.message as string}
                </p>
              )}
            
            <div className="mt-2">
              <Input
                type="textarea"
                rows={7}
                cols={10}
                label="Short Description * (Max 150 words)"
                placeholder="Enter product description for quick view"
                {...register("short_description", {
                  required: "Description is required",
                  validate: (value) => {
                    const wordCount = value.trim().split(/\s+/).length;
                    return (
                      wordCount <= 150 ||
                      `Description cannot exceed 150 words (Current: ${wordCount})`
                    );
                  },
                })}
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.description.message as string}
                </p>
              )}
            </div>
            <div className="mt-2">
              <Input
                label="Tags *"
                placeholder="apple,flagship"
                {...register("tags", {
                  required: "Seperate related products tags with a coma,",
                })}
              />
              {errors.tags && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.tags.message as string}
                </p>
              )}
            </div>
            <div className="mt-2">
              <Input
                label="Warranty *"
                placeholder="1 Year / No Warranty"
                {...register("warranty", {
                  required: "Warranty is required!",
                })}
              />
              {errors.tags && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.tags.message as string}
                </p>
              )}
            </div>

            <div className="mt-2">
              <Input
                label="Slug *"
                placeholder="product_slug"
                {...register("slug", {
                  required: "Slug is required!",
                  pattern: {
                    value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                    message:
                      "Invalid slug format! Use only lowercase letters, numbers, and dashes (e.g., product-slug).",
                  },
                  minLength: {
                    value: 3,
                    message: "Slug must be at least 3 characters long.",
                  },
                  maxLength: {
                    value: 50,
                    message: "Slug cannot be longer than 50 characters.",
                  },
                })}
              />
              {errors.slug && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.slug.message as string}
                </p>
              )}
            </div>

            <div className="mt-2">
              <Input
                label="Brand"
                placeholder="Apple"
                {...register("brand")}
              />
              {errors.tags && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.tags.message as string}
                </p>
              )}
            </div>
            <div className="mt-2">
                <ColorSelector control={control} errors={errors} />
              </div>

              <div className="mt-2">
                <CustomSpecifications control={control} errors={errors} />
              </div>
                           <div className="mt-2">
                <CustomProperties control={control} errors={errors} />
              </div>
               <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Cash On Delivery *
                </label>
                <select
                  {...register("cash_on_delivery", {
                    required: "Cash on Delivery is required",
                  })}
                  defaultValue="yes"
                  className="w-full border outline-none border-gray-700 bg-transparent p-2 rounded-md text-white"
                >
                  <option value="yes" className="bg-black">
                    Yes
                  </option>
                  <option value="no" className="bg-black">
                    No
                  </option>
                </select>
                {errors.cash_on_delivery && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.cash_on_delivery.message as string}
                  </p>
                )}
              </div>

            </div>
             <div className="w-2/4">
               <label className="block font-semibold text-gray-300 mb-1">
                Category *
              </label>
              {isLoading ? (
                <p className="text-gray-400">Loading categories...</p>
              ) : isError ? (
                <p className="text-red-500">Failed to load categories</p>
              ) : (
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: "Category is required" }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full border outline-none border-gray-700 bg-transparent p-2 rounded-md text-white"
                    >
                      <option value="" className="bg-black">
                        Select Category
                      </option>
                      {categories?.map((category: string) => (
                        <option
                          value={category}
                          key={category}
                          className="bg-black"
                        >
                          {category}
                        </option>
                      ))}
                    </select>
                  )}
                />
              )}
              {errors.category && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.category.message as string}
                </p>
              )}

              <div className="mt-2">
                <label className="block font-semibold text-gray-300 mb-1">
                  Subcategory *
                </label>
                <Controller
                  name="subCategory"
                  control={control}
                  rules={{ required: "Subcategory is required" }}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full border outline-none border-gray-700 bg-transparent p-2 rounded-md text-white"
                    >
                      <option value="" className="bg-black">
                        Select Subcategory
                      </option>
                      {subcategories?.map((subcategory: string) => (
                        <option
                          key={subcategory}
                          value={subcategory}
                          className="bg-black"
                        >
                          {subcategory}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.subcategory && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.subcategory.message as string}
                  </p>
                )}
              </div>
             </div>


          </div>
        </div>
      </div>

    </form>
  )
}

export default page