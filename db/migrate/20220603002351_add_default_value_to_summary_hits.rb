class AddDefaultValueToSummaryHits < ActiveRecord::Migration[7.0]
  def change
    change_column_default :summaries, :raw_hits, from: nil, to: []
  end
end
