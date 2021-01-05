import React, { useState,useEffect } from "react";
import "./../styles/App.css";
import ListItem from "./ListItem";
export default function TodoList({username,logoutHandler}) {
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");

  const addItem = () => {
    // send data to backend
    fetch("http://localhost:9999/todo", {
      method: "POST",
      body: JSON.stringify({ task: newItem }),
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include"
    })
      .then((r) => r.json())
      .then((resp) => {
        console.log("Got data from Post backend");

        items.push(resp);
        setItems([...items]);
        setNewItem("");
      });
  };
  const newItemChanged = (evt) => {
    setNewItem(evt.target.value);
  };
  const deleteHandler = (itemIdx) => {
    const idToDelete = items[itemidx]._id;
    fetch(`http://localhost:9999/todo/${idToDelete}`, {
      method: "DELETE",
      credentials: "include"
    }).then((r) => {
      console.log("Got successfully DELETED");
      items.splice(itemIdx, 1);
      setItems([...items]);
    });
  };
  const editHandler = (editedValue, itemIdx) => {
    const idToEdit = items[itemIdx]._id;
    fetch(`http://localhost:9999/todo/${idToEdit}`, {
      method: "PUT",
      body: JSON.stringify({ task: editedValue }),
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((r) => r.json())
      .then((resp) => {
        console.log("Got successfully response from PUT", resp);
        items[itemIdx] = resp;
        setItems([...items]);
      });
  };

  useEffect(() => {
    fetch("http://localhost:9999/todo", { credentials: "include" })
      .then((r) => r.json())
      .then((arr) => {
        const sortedArr = arr.sort((a, b) => {
          const aDateNumeric = new Date(a.creationTime).valueOf();
          const bDateNumeric = new Date(b.creationTime).valueOf();

          return aDateNumeric - bDateNumeric;
        });

        setItems(sortedArr);
      });
  }, []);
  return (
    <div id="main">
		<div className="user">
			<div>Username: <b>{username}</b></div>
			<button className="logout" onClick={logoutHandler}>Logout</button>
		</div>
      <textarea
        id="task"
        onChange={newItemChanged}
        placeholder="New Item"
        value={newItem}
      ></textarea>
      <button id="btn" onClick={addItem} disabled={newItem.trim().length === 0}>
        Add Item
      </button>
      {items.map((item, idx) => (
        <ListItem
          item={item}
          key={item._id}
          idx={idx}
          deleteHandler={deleteHandler}
          editHandler={editHandler}
        />
      ))}
    </div>
  );
}
