//Extrae Router de express:
const { Router } = require('express')
const { check } = require('express-validator')

const {
  validarCampos,
  validarJWT,
  tieneRole,
} = require('../middlewares')

const {
  usuariosGet,
  usuariosPut,
  usuariosPost,
  usuariosDelete,
  usuariosPatch,
} = require('../controllers/usuarios')
const {
  esRoleValido,
  emailExiste,
  existeUsuarioPorId,
} = require('../helpers/db-validators')

const router = Router()

//En este caso no se ejecuta la función usuariosGet(), se llama a esa referencia (el controlador) y se le pasa req y res
router.get('/', usuariosGet)

//Si el método (post en este caso) tiene tres argumentos, el segundo son middlewares
router.post(
  '/',
  [
    //check valida los campos del body y/o los params
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check(
      'password',
      'El password es obligatorio y debe tener mínimo 6 caracteres',
    ).isLength({ min: 6 }),
    check('correo', 'El correo no es válido').isEmail(),
    check('correo').custom(emailExiste),
    // check('rol', 'No es un rol permitido').isIn(['ADMIN_ROLE', 'USER_ROLE']),
    check('rol').custom(esRoleValido), //Es igual a custom(rol => esRoleValido(rol)) porque solo hay un parámetro (rol) que se recibe y es el mismo que se le envía a la función esRoleValido(rol)
    validarCampos,
  ],
  usuariosPost,
)

router.put(
  '/:id',
  [
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(existeUsuarioPorId),
    check('rol').custom(esRoleValido),
    validarCampos,
  ],
  usuariosPut,
)

router.delete(
  '/:id',
  [
    validarJWT,
    // esAdminRole,
    tieneRole('ADMIN_ROLE', 'VENTAS_ROLE'),
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom(existeUsuarioPorId),
    validarCampos,
  ],
  usuariosDelete,
)

router.patch('/', usuariosPatch)

module.exports = router
