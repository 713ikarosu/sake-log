-- Make drink_name nullable
alter table logs alter column drink_name drop not null;

-- Make drink_type required (assuming all existing logs have a type or we set a default)
-- First, update any null drink_types to 'other' to avoid errors
update logs set drink_type = 'other' where drink_type is null;
alter table logs alter column drink_type set not null;
