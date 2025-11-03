import React from "react";
import "./BattleVs.css";

export default function BattleVs() {
  return (
    <div className="arena">
      {/* Left side: human vs computer */}
      <div className="side">
        <div className="warrior">
          <div className="arm-right"></div>
          <div className="sword"></div>
        </div>
        <div className="computer">
          <div className="screen">
            <div className="code">function battle() &#123;</div>
            <div className="code">  console.log("Battle starts!");</div>
            <div className="code">  let power = 100;</div>
            <div className="code">  return victory;</div>
            <div className="code">&#125;</div>
            <div className="code">battle();</div>
          </div>
        </div>
      </div>

      <div className="vs">VS</div>

      {/* Right side: computer vs human */}
      <div className="side">
        <div className="computer">
          <div className="screen">
            <div className="code">class Warrior &#123;</div>
            <div className="code">  constructor(name) &#123;</div>
            <div className="code">    this.name = name;</div>
            <div className="code">  &#125;</div>
            <div className="code">  attack() &#123;</div>
            <div className="code">    return power;</div>
            <div className="code">  &#125;</div>
            <div className="code">&#125;</div>
            <div className="code">let warrior = new Warrior("Hero");</div>
          </div>
        </div>
        <div className="warrior mirror">
          <div className="arm-right"></div>
          <div className="sword"></div>
        </div>
      </div>
    </div>
  );
}
