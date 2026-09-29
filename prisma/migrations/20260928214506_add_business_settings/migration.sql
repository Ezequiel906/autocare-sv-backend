ALTER TABLE `business_settings`
ADD CONSTRAINT `business_settings_singleton` CHECK (`id` = 1);
