class AddApiTokenToAccount < ActiveRecord::Migration[7.0]
  def change
    add_column :accounts, :api_token, :string
  end
end
