class AddTimeZoneToAccount < ActiveRecord::Migration[7.0]
  def change
    add_column :accounts, :timezone, :string, default: "UTC"
  end
end
