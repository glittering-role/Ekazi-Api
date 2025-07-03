import {createResponse} from "../../../logs/helpers/response";
import {Roles} from '../model/associations';
import {Op} from 'sequelize';
import {handleError} from "../../../logs/helpers/erroHandler";
import {asyncHandler} from "../../../middleware/async-middleware";
import {Request, Response} from "express";
import {validateInput} from "../../../utils/validation/validation";
import paginate from 'express-paginate';


// Validate pagination parameters
const validatePagination = (req: Request, res: Response): { page: number; limit: number } | undefined => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;

  if (isNaN(page) || page < 1) {
    res.status(400).json(createResponse(false, 'Invalid page number, should start with 1'));
    return undefined;
  }

  if (isNaN(limit) || limit < 1) {
    res.status(400).json(createResponse(false, 'Invalid limit number, should be at least 1'));
    return undefined;
  }

  return { page, limit };
};

// Define a function to retrieve all roles
const getRoles = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const pagination = validatePagination(req, res);
    if (!pagination) return; // Stop if validation failed

    const { page, limit } = pagination;

    const [results, itemCount] = await Promise.all([
      Roles.findAll({
        attributes : ['id', 'role_name', 'role_status'],
        offset: (page - 1) * limit,
        limit,
      }),
      Roles.count(),
    ]);

    const pageCount = Math.ceil(itemCount / limit);

    res.status(200).json(
        createResponse(true, 'Roles fetched successfully', {
          roles: results,
          meta: {
            pageCount,
            itemCount,
            currentPage: page,
            hasMore: page < pageCount,
            pages: paginate.getArrayPages(req)(3, pageCount, page),
          },
        })
    );
  } catch (error) {
    handleError(error, req, res, 'An error occurred while fetching roles');
  }
});

// Define a function to create a new role
const createRole= asyncHandler(async (req: Request, res: Response): Promise<void> => {

  // Validate the request input using Joi validation
  const { value, errors } = validateInput(req.body);
  if (errors) {
    res.status(400).json(createResponse(false, "Validation failed", { errors }));
    return;
  }

  // Ensure value is defined
  if (!value) {
    res.status(400).json(createResponse(false, "Validation failed", { errors: ["Invalid input data"] }));
    return;
  }

  const { role_name } = value;

  try {
    // Check if a role with the same name already exists
    const existingRole = await Roles.findOne({
      where: { role_name: role_name }
    });

    if (existingRole) {
       res.status(400).json(createResponse(false, 'Role with this name already exists'));
       return
    }

    // Create the new role if it does not exist
    await Roles.create({
      role_name: role_name,
      role_status: true
    });

    res.status(201).json(createResponse(true, 'Role created successfully'));
  } catch (error) {
    handleError(error, req, res, 'An error occurred while creating the role');
  }
});

// Define a function to update a role's name
const updateRoleName = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const roleId = req.params.id;

  // Validate the request input using Joi validation
  const { value, errors } = validateInput(req.body);

  if (errors) {
    res.status(400).json(createResponse(false, "Validation failed", { errors }));
    return;
  }

  // Ensure value is defined
  if (!value) {
    res.status(400).json(createResponse(false, "Validation failed", { errors: ["Invalid input data"] }));
    return;
  }

  const { role_name } = value;

  try {
    // Find the role by ID
    const role = await Roles.findByPk(roleId);

    if (!role) {
       res.status(404).json(createResponse(false, 'Role not found'));
       return
    }

    // Check if the new role name already exists (excluding the current role)
    const existingRole = await Roles.findOne({
      where: {
        role_name: role_name,
        id: { [Op.ne]: roleId }
      }
    });

    if (existingRole) {
       res.status(400).json(createResponse(false, 'Role with this name already exists'));
       return
    }

    // Update the role name
    role.role_name = role_name;

    await role?.save();

    // Respond with success message
    res.status(201).json(createResponse(true, 'Role name updated successfully'));
  } catch (error) {
    handleError(error, req, res, 'An error occurred while updating the role name');
  }
});

// Define a function to delete a role
const deleteRole = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const roleId = req.params.id;
    const role = await Roles.findByPk(roleId);

    if (!role) {
       res.status(404).json(createResponse(false, 'Role not found'));
       return
    }

    // Check if the role is active
    if (role.role_status) { // Assuming role_status is true for active
       res.status(400).json(createResponse(false, 'Role cannot be deleted because it is active'));
       return
    }

    // Delete the role from the database
    await role.destroy();

    res.json(createResponse(true, 'Role deleted successfully'));
  } catch (error) {
    handleError(error, req, res, 'An error occurred while deleting the role');

  }
});

// Define a function to update role status
const updateRoleStatus= asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const roleId = req.params.id;
  try {
    // Find the role by ID
    const role = await Roles.findByPk(roleId);

    if (!role) {
       res.status(404).json(createResponse(false, 'Role not found'));
       return
    }

    // Toggle the role's status
    role.role_status = !role.role_status;
    await role.save();

    // Respond with success message
    res.status(201).json(createResponse(true, `Role status updated to ${role.role_status ? 'active' : 'inactive'}`));
  } catch (error) {
    handleError(error, req, res, 'An error occurred while updating the role status');
  }
});

// Define a function to retrieve a role by its ID
const getRoleById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const roleId = req.params.id;

  try {
    // Find the role by ID
    const role = await Roles.findByPk(roleId);

    if (!role) {
       res.status(404).json(createResponse(false, 'Role not found'));
       return
    }

    // Respond with the role data
    res.status(200).json(createResponse(true, 'Role fetched successfully', {role}));

  } catch (error) {
    handleError(error, req, res, 'An error occurred while fetching the role');
  }
});

export {
  getRoles,
  createRole,
  deleteRole,
  getRoleById,
  updateRoleName,
  updateRoleStatus
};