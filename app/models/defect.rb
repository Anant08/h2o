class Defect < ActiveRecord::Base  
  belongs_to :reportable, :polymorphic => true
  belongs_to :user
  validates_presence_of :reportable_id, :description, :user_id

  def name
    self.display_name
  end

  def display_name
    self.reportable.nil? ? "#{self.reportable_id}: No longer exists" : self.reportable.name
  end
end
