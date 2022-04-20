use std::borrow::{Borrow, BorrowMut};
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::LookupMap;
use near_sdk::collections::Vector;
use near_sdk::collections::UnorderedSet;
use near_sdk::{env, near_bindgen,Timestamp};
use near_sdk::serde::{Deserialize, Serialize};

near_sdk::setup_alloc!();
#[derive(BorshDeserialize, BorshSerialize, Deserialize, Serialize, Debug, Default)]
#[serde(crate = "near_sdk::serde")]
pub struct Message {
    msg:String,
    date:Timestamp
}
#[derive(BorshDeserialize, BorshSerialize,Debug)]
pub struct Account {
    msgs:Vector<Message>,
}
#[derive(BorshSerialize)]
pub enum StorageKey {
    AccountMsgs
}
#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct StatusMessage {
    records: LookupMap<String, UnorderedSet<Message>>,
}

impl Default for StatusMessage {
    fn default() -> Self {
        Self {
            records: LookupMap::new(b"r".to_vec()),
        }
    }
}

#[near_bindgen]
impl StatusMessage {
    pub fn set_status(&mut self, message: String) {
        let account_id = env::signer_account_id();

        let mut msgs = self.records.get(&account_id);
        if(msgs.is_none()){
            let mut us = UnorderedSet::new(StorageKey::AccountMsgs.try_to_vec().unwrap());
            us.insert(&Message{
                msg: message,
                date: 0
            });
            self.records.insert(&account_id, &us);
        }else{
            let mut mmsgs = msgs.unwrap();
            mmsgs.insert(&Message{
                msg: message,
                date: 0
            });
            self.records.insert(&account_id,&mmsgs);
        }
    }

    pub fn get_status(&self, account_id: String) -> Option<Vec<Message>> {
        let messages = self.records.get(&account_id);
        //messages.unwrap().to_vec()
        return Some(messages.unwrap().to_vec())
    }
}
#[cfg(not(target_arch = "wasm32"))]
#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::MockedBlockchain;
    use near_sdk::{testing_env, VMContext};

    fn get_context(input: Vec<u8>, is_view: bool) -> VMContext {
        VMContext {
            current_account_id: "alice_near".to_string(),
            signer_account_id: "bob_near".to_string(),
            signer_account_pk: vec![0, 1, 2],
            predecessor_account_id: "carol_near".to_string(),
            input,
            block_index: 0,
            block_timestamp: 0,
            account_balance: 0,
            account_locked_balance: 0,
            storage_usage: 0,
            attached_deposit: 0,
            prepaid_gas: 10u64.pow(18),
            random_seed: vec![0, 1, 2],
            is_view,
            output_data_receivers: vec![],
            epoch_height: 0,
        }
    }

    #[test]
    fn set_get_message() {
        let context = get_context(vec![], false);
        testing_env!(context);
        let mut contract = StatusMessage::default();
        contract.set_status("hello".to_string());
        contract.set_status("hello2".to_string());
        println!("{:?}",contract.get_status("bob_near".to_string()));
        assert_eq!(2,contract.get_status("bob_near".to_string()).unwrap().len());
    }
/*
    #[test]
    fn get_nonexistent_message() {
        let context = get_context(vec![], true);
        testing_env!(context);
        let contract = StatusMessage::default();
        assert_eq!(None, contract.get_status("francis.near".to_string()));
    }*/
}