import React, { useState } from "react";
import axios from "axios";
export const AddProduct = () => {
  let [product, setProduct] = useState([
    {
      name: "",
      image: "",
      richDescription: "",
      description: "",
      brand: "brand",
      price: 234,
      rating: 3,
      numReviews: 5,
      isFeatured: false,
      countInStock: 345,
      category: "",
      images: [],
    },
  ]);
  const handleChange = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    setProduct((prevProduct) => {
      return { ...product, [name]: value };
    });
  };
  const handleSubmit = async () => {
    const newProduct = (product = {
      name: product.name,
      image: product.image,
      richDescription: product.richDescription,
      description: product.description,
      brand: product.brand,
      price: Number(product.price),
      rating: Number(product.rating),
      numReviews: Number(product.numReviews),
      isFeatured: product.isFeatured,
      countInStock: Number(product.countInStock),
      category: product.category,
      images: product.images,
    });
    await axios.post("/api/v1/products", newProduct);
  };
  return (
    <div className='container gap-2'>
      <form action='/products' method='POST'>
        <p>Product Information</p>
        <div className='form-group '>
          <input
            className='form-control mb-3 '
            placeholder='product name'
            type='text'
            required
            onChange={handleChange}
            name='name'
            value={product.value}
          />
        </div>
        <div>
          <input
            className='form-control mb-3'
            placeholder='image'
            type='file'
            required
            onChange={handleChange}
            value={product.value}
            name='image'
          />
        </div>
        <div className='form-group gap-3 '>
          <input
            className='form-control mb-3'
            placeholder='rich description'
            type='text'
            required
            onChange={handleChange}
            value={product.value}
            name='richDescription'
          />
        </div>
        <div className='form-group gap-3 '>
          <input
            className='form-control mb-3'
            placeholder='description'
            type='text'
            required
            onChange={handleChange}
            value={product.value}
            name='description'
          />
        </div>
        <div className='form-group'>
          <input
            className='form-control mb-3'
            placeholder='brand name'
            type='text'
            required
            onChange={handleChange}
            value={product.value}
            name='brand'
          />
        </div>

        <div className='form-group'>
          <input
            className='form-control mb-3'
            placeholder='price'
            type='number'
            required
            onChange={handleChange}
            value={product.value}
            name='price'
          />
        </div>
        <div className='form-group'>
          <input
            className='form-control mb-3'
            placeholder='rating'
            type='number'
            value={product.value}
            onChange={handleChange}
            name='rating'
          />
        </div>
        <div className='form-group'>
          <input
            className='form-control mb-3'
            placeholder='reviews'
            type='number'
            required
            onChange={handleChange}
            value={product.value}
            name='numReviews'
          />
        </div>
        <div>
          <div className='form-group'>
            <input
              className='form-control mb-3'
              placeholder='Yes or No'
              type='boolean'
              required
              onChange={handleChange}
              value={product.value}
              name='isFeatured'
            />
          </div>
          <div className='form-group'>
            <input
              className='form-control mb-3 '
              placeholder='Count In stuck'
              type='number'
              required
              onChange={handleChange}
              value={product.value}
              name='countInStock'
            />
          </div>

          <div className='form-group'>
            <p className='form-control mb-3'>Category</p>
            <select value={product.value} onChange={handleChange} name='category'>
              <option value='Health'>Health</option>
              <option value='Electronics'>Electronics</option>
              <option value='General'>General</option>
            </select>
          </div>
          <button
            className='btn btn-md btn-info mt-3 mb-4'
            name='submit'
            type='submit'
            onClick={handleSubmit}>
            Add product
          </button>
        </div>
      </form>
    </div>
  );
};
