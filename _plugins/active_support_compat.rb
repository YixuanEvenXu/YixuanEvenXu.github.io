# Opt in to the timezone-preserving behavior that becomes the default in Rails 8.
require "active_support"

ActiveSupport.to_time_preserves_timezone = true
