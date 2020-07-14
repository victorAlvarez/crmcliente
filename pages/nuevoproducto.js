import React, { useState } from 'react';
import Layout from '../components/Layout';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { gql, useMutation } from '@apollo/client';
import Swal from 'sweetalert2';
import { useRouter } from 'next/router';

const NUEVO_PRODUCTO = gql`
  mutation nuevoProducto($input: ProductoInput) {
    nuevoProducto(input: $input) {
      id
      nombre
      existencia
      precio
      creado
    }
  }
`;

const OBTENER_PRODUCTOS = gql`
  query obtenerProductos {
    obtenerProductos {
      id
      nombre
      precio
      existencia
    }
  }
`;

const NuevoProducto = () => {

  const router = useRouter();

  const [ mensaje, guardarMensaje ] = useState(null);

  // Mutation para crear nuevos productos
  const [ nuevoProducto ] = useMutation(NUEVO_PRODUCTO, {
    update(cache, { data: { nuevoProducto }}) {
      //Obtener el objeto de cache que deseamos actualizar
      const { obtenerProductos } = cache.readQuery({ query: OBTENER_PRODUCTOS });

      // Reescribimos el cache
      cache.writeQuery({
        query: OBTENER_PRODUCTOS,
        data: {
          obtenerProductos: [...obtenerProductos, nuevoProducto ]
        }
      });
    }
  })

  const formik = useFormik({
    initialValues: {
      nombre: '',
      existencia: '',
      precio: ''
    },
    validationSchema: Yup.object({
      nombre: Yup.string()
                  .required('El nombre del producto es obligatorio'),
      existencia: Yup.number()
                      .required('La cantidad del producto es obligatoria')
                      .positive('No se aceptan números negativos')
                      .integer('La cantidad de productos deben ser números enteros'),
      precio: Yup.number()
                  .required('El precio es obligatorio')
                  .positive('No se aceptan números negativos')
    }),
    onSubmit: async valores => {
      
      const { nombre, existencia, precio } = valores;

      try {
        const { data } = await nuevoProducto({
          variables: {
            input: {
              nombre,
              existencia,
              precio
            }
          }
        });

        Swal.fire(
          'Creado',
          'Se creó correctamente el producto',
          'success'
        );

        router.push('/productos');
      } catch (error) {
        guardarMensaje(error.message);

        setTimeout(() => {
          guardarMensaje(null);
        }, 2000);
      }

    }
  });

  const mostrarMensaje = () => {
    return (
      <div className="bg-white py-2 px-3 w-full my-3 max-w-sm text-center mx-auto">
        <p>{mensaje}</p>
      </div>
    );
  };

  return ( 
    <Layout>
      <h1 className="text-2xl text-gray-800 font-light">Crear Nuevo Producto</h1>

      {mensaje && mostrarMensaje()}

      <div className="flex justify-center mt-5">
        <div className="w-full max-w-lg">
          <form
            className="bg-white shadow-md px-8 pt-6 pb-8 mb-4"
            onSubmit={formik.handleSubmit}
          >
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nombre">
                Nombre
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outile"
                id="nombre"
                type="text"
                placeholder="Nombre Cliente"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.nombre}
              />
            </div>

            { formik.touched.nombre && formik.errors.nombre ? (
              <div className="my-2 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                <p>{formik.errors.nombre}</p>
              </div>
            ) : null }

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="existencia">
                Cantidad Disponible
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outile"
                id="existencia"
                type="number"
                placeholder="Cantidad Disponible"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.existencia}
              />
            </div>

            { formik.touched.existencia && formik.errors.existencia ? (
              <div className="my-2 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                <p>{formik.errors.existencia}</p>
              </div>
            ) : null }

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="precio">
                Precio Producto
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outile"
                id="precio"
                type="number"
                placeholder="Precio Producto"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.precio}
              />
            </div>

            { formik.touched.precio && formik.errors.precio ? (
              <div className="my-2 bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
                <p>{formik.errors.precio}</p>
              </div>
            ) : null }

            <input 
              type="submit"
              className="bg-gray-800 w-full mt-5 p-2 text-white uppercase font-bold hover:bg-gray-900"
              value="Agregar Nuevo Producto"
            />  
          </form>
        </div>
      </div>
    </Layout>  
  );
}
 
export default NuevoProducto;